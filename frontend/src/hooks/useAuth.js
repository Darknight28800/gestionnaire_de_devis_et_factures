import { useContext } from "react";
import { AuthContexte } from "../contexte/authContexte";

export default function useAuth() {
    return useContext(AuthContexte);
}
