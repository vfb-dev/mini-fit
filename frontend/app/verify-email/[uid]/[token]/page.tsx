"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function VerifyEmailPage() {
  const params = useParams();

  const uid = params.uid as string;
  const token = params.token as string;

  useEffect(() => {
    fetch(`http://localhost:8000/verify-email/${uid}/${token}/`);
  }, [uid, token]);

  return <h1>Verifying email...</h1>;
}
