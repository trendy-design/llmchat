"use client";
import { Button, Flex } from "@/components/ui";
import { cn } from "@/helper/clsx";
import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { Drawer } from "vaul";

export type TAuthContext = {
  user?: User;
  open: () => void;
  logout: () => void;
};
export const AuthContext = createContext<TAuthContext | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within a AuthProvider");
  return context;
};

export type TAuthProvider = {
  children: React.ReactNode;
};
export const AuthProvider = ({ children }: TAuthProvider) => {
  const [user, setUser] = useState<User>();
  const [openSignIn, setOpenSignIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      data.user && setUser(data.user);
      console.log("user", data.user);
    });
  }, []);

  const open = () => {
    setOpenSignIn(true);
  };

  const logout = () => {
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, open, logout }}>
      {children}
      <Drawer.Root
        direction="bottom"
        shouldScaleBackground
        open={openSignIn}
        onOpenChange={setOpenSignIn}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[400] bg-zinc-500/70 backdrop-blur-sm dark:bg-zinc-900/70" />
          <Drawer.Content
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[500] mx-auto mt-24 flex max-h-[530px] flex-col items-center outline-none md:bottom-4 md:left-[50%]",
              `w-full md:ml-[-200px] md:w-[400px]`,
            )}
          >
            <div className="relative w-full space-y-4 rounded-lg bg-white dark:border dark:border-white/10 dark:bg-zinc-800">
              <Flex className="w-full border-b p-3" gap="sm" items="center">
                <Button
                  className="w-full"
                  onClick={() => {
                    supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: "http://localhost:3000/auth/callback",
                      },
                    });
                  }}
                >
                  Sign In with Twitter
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: "http://localhost:3000/auth/callback",
                      },
                    });
                  }}
                >
                  Sign In with Google
                </Button>
              </Flex>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </AuthContext.Provider>
  );
};
