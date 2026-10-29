import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { RequireAuth } from './auth/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import ClassPage from './pages/ClassPage.jsx';
import Rankings from './pages/Rankings.jsx';
import WriteReview from './pages/WriteReview.jsx';
import AddClass from './pages/AddClass.jsx';
import SignUp from './pages/SignUp.jsx';
import SignIn from './pages/SignIn.jsx';
import Account from './pages/Account.jsx';
import EditAccount from './pages/EditAccount.jsx';
import Favorites from './pages/Favorites.jsx';
import NotFound from './pages/NotFound.jsx';
import About from './pages/About.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="classes/new" element={<RequireAuth><AddClass /></RequireAuth>} />
        <Route path="classes/:id" element={<ClassPage />} />
        <Route path="classes/:id/review" element={<RequireAuth><WriteReview /></RequireAuth>} />
        <Route path="review" element={<RequireAuth><WriteReview /></RequireAuth>} />
        <Route path="top" element={<Rankings dir="top" />} />
        <Route path="bottom" element={<Rankings dir="bottom" />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="account/edit" element={<RequireAuth><EditAccount /></RequireAuth>} />
        <Route path="favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
