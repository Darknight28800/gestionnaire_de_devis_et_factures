import { useContext } from "react";
import { AuthContexte } from "../contexte/authProvider";

export default function useAuth() {
    return useContext(AuthContexte);
}
