"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export const SignOutButton = () => {
    return (
        <Button 
            variant="outline" 
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="ml-2"
        >
            Sign Out
        </Button>
    );
};
