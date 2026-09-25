"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomePage from "@/app/page";

export default function BloomPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return <HomePage />;
}
