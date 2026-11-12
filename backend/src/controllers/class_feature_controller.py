from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, PositiveInt

from src.services.class_feature_service import ClassFeatureService, FeatureError


class FavoriteReplacement(BaseModel):
    new_course_id: PositiveInt


class ClassUpdate(BaseModel):
    code: str
    university: str


class RankedClass(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    university_id: int | None
    rating: float


def get_class_feature_service() -> ClassFeatureService:
    from src.repositories.class_feature_repository import ClassFeatureRepository

    return ClassFeatureService(ClassFeatureRepository())


def require_signed_in_account(request: Request) -> int:
    # The login layer supplies this value after verifying the session or token.
    account_id = getattr(request.state, "account_id", None)
    if type(account_id) is not int or account_id <= 0:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    return account_id


def require_account_owner(
    account_id: PositiveInt,
    signed_in_account: Annotated[int, Depends(require_signed_in_account)],
) -> None:
    if account_id != signed_in_account:
        raise HTTPException(
            status_code=403,
            detail="You can only change your own account.",
        )


def require_course_manager(
    request: Request,
    signed_in_account: Annotated[int, Depends(require_signed_in_account)],
) -> None:
    if getattr(request.state, "can_manage_courses", False) is not True:
        raise HTTPException(
            status_code=403,
            detail="Course management permission is required.",
        )


Service = Annotated[ClassFeatureService, Depends(get_class_feature_service)]


class ClassFeatureController:
    def __init__(self):
        self.router = APIRouter()
        owner = [Depends(require_account_owner)]
        manager = [Depends(require_course_manager)]

        self.router.add_api_route(
            "/accounts/{account_id}/favorites/{course_id}",
            self.update_favorite_class,
            methods=["PUT"],
            dependencies=owner,
        )
        self.router.add_api_route(
            "/accounts/{account_id}/favorites/{course_id}",
            self.remove_course_from_favorite_list,
            methods=["DELETE"],
            dependencies=owner,
        )
        self.router.add_api_route(
            "/accounts/{account_id}/reviews/{review_id}/like",
            self.like_review,
            methods=["POST"],
            dependencies=owner,
        )
        self.router.add_api_route(
            "/accounts/{account_id}/reviews/{review_id}/dislike",
            self.dislike_review,
            methods=["POST"],
            dependencies=owner,
        )
        self.router.add_api_route(
            "/classes/top-rated",
            self.get_top_rated_classes,
            methods=["GET"],
            response_model=list[RankedClass],
        )
        self.router.add_api_route(
            "/classes/bottom-rated",
            self.get_bottom_rated_classes,
            methods=["GET"],
            response_model=list[RankedClass],
        )
        self.router.add_api_route(
            "/classes/{course_id}",
            self.delete_class,
            methods=["DELETE"],
            dependencies=manager,
        )
        self.router.add_api_route(
            "/classes/{course_id}",
            self.update_class,
            methods=["PUT"],
            dependencies=manager,
        )

    def update_favorite_class(
        self,
        account_id: PositiveInt,
        course_id: PositiveInt,
        body: FavoriteReplacement,
        service: Service,
    ) -> bool:
        return service.update_favorite_class(
            account_id, course_id, body.new_course_id
        )

    def remove_course_from_favorite_list(
        self,
        account_id: PositiveInt,
        course_id: PositiveInt,
        service: Service,
    ) -> bool:
        return service.remove_course_from_favorite_list(account_id, course_id)

    def like_review(
        self, account_id: PositiveInt, review_id: PositiveInt, service: Service
    ) -> bool:
        return service.like_review(account_id, review_id)

    def dislike_review(
        self, account_id: PositiveInt, review_id: PositiveInt, service: Service
    ) -> bool:
        return service.dislike_review(account_id, review_id)

    def get_top_rated_classes(self, service: Service):
        return service.get_top_rated_classes()

    def get_bottom_rated_classes(self, service: Service):
        return service.get_bottom_rated_classes()

    def delete_class(self, course_id: PositiveInt, service: Service) -> bool:
        return service.delete_class(course_id)

    def update_class(
        self, course_id: PositiveInt, body: ClassUpdate, service: Service
    ) -> bool:
        return service.update_class(course_id, body.code, body.university)


async def handle_feature_error(
    request: Request, error: FeatureError
) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code,
        content={"detail": error.detail},
    )


def register_class_feature_routes(app: FastAPI) -> None:
    app.add_exception_handler(FeatureError, handle_feature_error)
    app.include_router(ClassFeatureController().router)