"use client";
import { Button, Flex, Type } from "@/components/ui";
import { supabase } from "@/libs/supabase/client";
import { cn } from "@/libs/utils/clsx";
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
    supabase?.auth.getUser().then(({ data }) => {
      data.user && setUser(data.user);
    });
  }, []);

  const open = () => {
    setOpenSignIn(true);
  };

  const logout = async () => {
    await supabase?.auth.signOut();
    window.location.reload();
  };

  const signInWithGoogle = () => {
    supabase?.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithGithub = () => {
    supabase?.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, open, logout }}>
      {children}
      <Drawer.Root
        direction="bottom"
        shouldScaleBackground
        modal
        open={openSignIn}
        onOpenChange={setOpenSignIn}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[400] bg-zinc-500/70 backdrop-blur-sm dark:bg-zinc-900/70" />
          <Drawer.Content
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[500] mx-auto mt-24 flex max-h-[530px] flex-col items-center outline-none md:bottom-8 md:left-[50%]",
              `w-full md:ml-[-190px] md:w-[380px]`,
            )}
          >
            <div className="relative w-full space-y-4 rounded-lg bg-white dark:border dark:border-white/10 dark:bg-zinc-800">
              <Flex
                className="w-full p-6"
                items="center"
                direction="col"
                gap="lg"
              >
                <Flex gap="xs" direction="col">
                  <Type weight="bold" size="lg">
                    Join our community!
                  </Type>
                  <Type size="sm" textColor="secondary">
                    Sign up to unlock your daily free usage limit and receive
                    updates on new features.
                  </Type>
                </Flex>
                <Flex gap="sm" direction="col" className="w-full">
                  <Button
                    className="plausible-event-name=Signup w-full"
                    rounded="full"
                    variant="secondary"
                    size="lg"
                    onClick={signInWithGoogle}
                  >
                    Sign In with Google
                  </Button>
                  <Button
                    className="plausible-event-name=Signup w-full"
                    rounded="full"
                    size="lg"
                    onClick={signInWithGithub}
                  >
                    Sign In with Github
                  </Button>
                </Flex>
                <Type size="xs" textColor="tertiary">
                  Login is required to ensure fair usage however, your chat
                  sessions and API keys will be stored locally in your browser.
                </Type>
              </Flex>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </AuthContext.Provider>
  );
};
