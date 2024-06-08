import { Route, Routes } from "react-router";
import { lazy } from "react";
import Layout from "./layout/Layout.tsx"
import ResetPasswordPage from "./pages/credentials/ResetPasswordPage.tsx"
import ChangePasswordPage from "./pages/credentials/ChangePasswordPage.tsx"
import ResourceUserListPage from "./pages/account/resource/user/ResourceUserListPage.tsx"
import ResourceMeetingListPage from "./pages/account/resource/meetings/ResourceMeetingListPage.tsx"

const LoginPage = lazy(() => import("./pages/LoginPage.tsx"))
const JoinPage = lazy(() => import("./pages/join/InvitePage.tsx"))
const VerificationPage = lazy(() => import("./pages/join/VerificationPage.tsx"))

const AccountLayout = lazy(() => import("./pages/account/AccountLayout.tsx"))
const AccountPage = lazy(() => import("./pages/account/AccountPage.tsx"))
const UserListPage = lazy(() => import("./pages/account/resource/user/UserListPage.tsx"))

const ResourceFileList = lazy(() => import("./pages/account/resource/file/ResourceFileListPage.tsx"))

const TeamListPage = lazy(() => import("./pages/account/resource/teams/TeamListPage.tsx"))
const TeamSettingsPage = lazy(() => import("./pages/account/resource/teams/TeamSettingsPage.tsx"))
const TeamPage = lazy(() => import("./pages/account/resource/teams/TeamPage.tsx"))

const MeetingListPage = lazy(() => import("./pages/account/resource/meetings/MeetingListPage.tsx"))
const MeetingSettingsPage = lazy(() => import("./pages/account/resource/meetings/MeetingSettingsPage.tsx"))
const MeetingPage = lazy(() => import("./pages/account/resource/meetings/MeetingPage.tsx"))

const NotFoundPage = lazy(() => import("./pages/NotFoundPage.tsx"))

export default function App() {
	return (
		<Routes>
			<Route path="/" element={ <Layout/> }>
				<Route path="/" element={ <LoginPage/> }/>

				<Route path="/invite" element={ <JoinPage/> }/>
				<Route path="/verify" element={ <VerificationPage/> }/>

				<Route path="reset-password" element={ <ResetPasswordPage/> }/>
				<Route path="password" element={ <ChangePasswordPage/> }/>

				<Route path="/@me" element={ <AccountLayout/> }>
					<Route path="/@me" element={ <AccountPage/> }/>
					<Route path="/@me/users" element={ <UserListPage/> }/>

					<Route path="/@me/teams" element={ <TeamListPage/> }/>
					<Route path="/@me/teams/:id" element={ <TeamPage/> }/>
					<Route path="/@me/teams/:id/files/*" element={ <ResourceFileList type="TEAM"/> }/>
					<Route path="/@me/teams/:id/settings" element={ <TeamSettingsPage/> }/>
					<Route path="/@me/teams/:id/users" element={ <ResourceUserListPage type="TEAM"/> }/>
					<Route path="/@me/teams/:id/meetings" element={ <ResourceMeetingListPage type="TEAM"/> }/>

					<Route path="/@me/meetings" element={ <MeetingListPage/> }/>
					<Route path="/@me/meetings/:id" element={ <MeetingPage/> }/>
					<Route path="/@me/meetings/:id/files/*" element={ <ResourceFileList type="MEETING"/> }/>
					<Route path="/@me/meetings/:id/settings" element={ <MeetingSettingsPage/> }/>
					<Route path="/@me/meetings/:id/users" element={ <ResourceUserListPage type="MEETING"/> }/>
				</Route>

				<Route path="*" element={ <NotFoundPage/> }/>
			</Route>
		</Routes>
	)
}