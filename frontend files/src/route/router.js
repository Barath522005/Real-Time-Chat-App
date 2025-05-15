import {createBrowserRouter} from "react-router-dom";
import HomePage from '../components/HomePage';
import Login from '../components/Login';
import Signup from '../components/Signup';
import AdminPanel from '../components/AdminPanel';
import CreateGroup from "../components/GroupCreation";
import GroupChatLayout from "../components/GroupChatLayout";

const router = createBrowserRouter([
    {
      path:"/",
      element:<HomePage/>
    },
    {
      path:"/signup",
      element:<Signup/>
    },
    {
      path:"/login",
      element:<Login/>
    },
    {
      path: "/admin",
      element: <AdminPanel />
    },
    {
      path: "/create-group",
      element: <CreateGroup />,
    },
    {
      path: "/groups",
      element: <GroupChatLayout />,
    },
    {
      path: "/group/:groupId",
      element: <GroupChatLayout />,
    },
])

export default router;