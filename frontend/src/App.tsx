import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./contexts/WalletContext";
import { SorobanProvider } from "./contexts/SorobanContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreatePollPage } from "./pages/CreatePollPage";
import { PollDetailsPage } from "./pages/PollDetailsPage";
import { BrowsePollsPage } from "./pages/BrowsePollsPage";
import { MyPollsPage } from "./pages/MyPollsPage";
import { MyVotesPage } from "./pages/MyVotesPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <SorobanProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/create" element={<CreatePollPage />} />
                  <Route path="/poll/:id" element={<PollDetailsPage />} />
                  <Route path="/browse" element={<BrowsePollsPage />} />
                  <Route path="/my-polls" element={<MyPollsPage />} />
                  <Route path="/my-votes" element={<MyVotesPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </SorobanProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
