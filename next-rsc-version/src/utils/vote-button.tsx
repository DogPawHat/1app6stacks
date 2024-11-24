"use client";

import { useFormStatus } from "react-dom";

export const VoteButton = ({
  winnerDexNumber,
  loserDexNumber,
  voteAction,
}: {
  winnerDexNumber: number;
  loserDexNumber: number;
  voteAction: () => Promise<void>;
}) => {
  const { pending } = useFormStatus();

  if (pending) {
    throw new Promise(() => {});
  }

  return (
    <button
      formAction={voteAction}
      className="px-8 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
      disabled={pending}
    >
      Vote
    </button>
  );
};