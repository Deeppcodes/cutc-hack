import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col items-center px-5 py-32 text-center lg:px-8">
      <div className="text-[13px] uppercase tracking-[0.12em] text-[#646c7a]">
        404
      </div>
      <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-[#e9ecf1]">
        No forecast here
      </h1>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#949cab]">
        This question does not exist, or it has not been added to the dataset
        yet.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Back to Discover</Link>
      </Button>
    </div>
  );
}
