import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";

import Home     from "./components/Home";
import Login    from "./components/Login";
import Register from "./components/Register";

import DiagnosticScreen       from "./components/DiagnosticScreen";
import ReviewScreen           from "./components/ReviewScreen";
import SecondDiagnosticScreen from "./components/SecondDiagnosticScreen";

import Dashboard  from "./components/Dashboard";
import DemoScreen from "./components/DemoScreen";
import QuizEngine from "./components/QuizEngine";

function PrivateRoute({ children }) {
  const { state } = useApp();
  return state.isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Module1() {
  const { state, dispatch } = useApp();

  if (state.screen === "demo") return <DemoScreen />;
  if (state.screen === "quiz") return <QuizEngine />;

  return <Dashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        <Route
          path="/app"
          element={
            <PrivateRoute>
              <DiagnosticScreen />
            </PrivateRoute>
          }
        />

        <Route
          path="/revisao"
          element={
            <PrivateRoute>
              <ReviewScreen />
            </PrivateRoute>
          }
        />

        <Route
          path="/segundo-diagnostico"
          element={
            <PrivateRoute>
              <SecondDiagnosticScreen />
            </PrivateRoute>
          }
        />

        <Route
          path="/modulo-1"
          element={
            <PrivateRoute>
              <Module1 />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}





