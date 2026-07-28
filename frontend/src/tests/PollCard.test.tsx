import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PollCard } from "../components/PollCard";
import { Poll } from "../utils/constants";
import { describe, it, expect } from "vitest";

const mockPoll: Poll = {
  poll_id: 1,
  creator: "GB375923ZFXP4KGVL66AOLQ32YQ73TIFB4YOTJMBZ6DOHVFF54B4BNO344444",
  title: "Should Stellar adopting Soroban upgrade v22?",
  description: "Community referendum on upgrading ledger protocol",
  category: 0,
  options: ["Yes", "No"],
  vote_counts: [75, 25],
  total_votes: 100,
  status: 0,
  created_at: 1700000000,
  start_time: 1700000000,
  end_time: 2700000000,
  winner: 9999,
};

describe("PollCard Component", () => {
  it("renders poll title, category, and options correctly", () => {
    render(
      <BrowserRouter>
        <PollCard poll={mockPoll} />
      </BrowserRouter>
    );

    expect(screen.getByText("Should Stellar adopting Soroban upgrade v22?")).toBeInTheDocument();
    expect(screen.getByText("Blockchain")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });
});
