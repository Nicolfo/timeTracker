import React, {createContext, useState, useContext, type PropsWithChildren} from 'react';

interface UserContextType {
  username: string | null;
  isLoading: boolean;
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <UserContext.Provider value={{ username, isLoading, setUsername, setIsLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};