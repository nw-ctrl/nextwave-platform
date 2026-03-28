type RoleLike = {
  role?: string | null;
};

export const isAdmin = (user: RoleLike | null | undefined) => user?.role === "admin";

export const isDoctor = (user: RoleLike | null | undefined) => !user?.role || user.role === "doctor";
