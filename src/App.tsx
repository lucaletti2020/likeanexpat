import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MeetingDetail from "./pages/MeetingDetail";
import Simulate from "./pages/Simulate";
import Prepare from "./pages/Prepare";
import Practice from "./pages/Practice";
import Feedback from "./pages/Feedback";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meeting/:meetingId" element={<MeetingDetail />} />
        <Route path="/meeting/:meetingId/simulate" element={<Simulate />} />
        <Route path="/meeting/:meetingId/prepare" element={<Prepare />} />
        <Route path="/meeting/:meetingId/practice-expressions" element={<Practice />} />
        <Route path="/meeting/:meetingId/feedback/:assessmentId" element={<Feedback />} />
        <Route path="/meeting/:meetingId/quiz/generated" element={<Quiz />} />
        <Route path="/meeting/:meetingId/quiz/generated/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}
