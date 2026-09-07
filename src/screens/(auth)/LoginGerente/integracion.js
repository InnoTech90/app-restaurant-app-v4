import { useCallback, useEffect, useState } from "react";
import { Database } from "./database";

export const useManagers = () => {
  const [managersState, setManagersState] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchManagers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const managers = await Database.getManagers();
      setManagersState(managers);
    } catch (err) {
      console.error("Error cargando managers:", err);
      setError(err);
      setManagersState([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  return { managersState, isLoading, error, refetch: fetchManagers };
};
