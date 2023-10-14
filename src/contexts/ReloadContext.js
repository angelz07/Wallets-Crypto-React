import { createContext, useState, useCallback } from 'react';

const ReloadContext = createContext({
    triggerReload: () => {},
    reloadFlag: false
  });

  export const ReloadProvider = ({ children }) => {
    const [reloadFlag, setReloadFlag] = useState(false);
  
    const triggerReload = useCallback(() => {
      console.log("Trigger reload called");
      setReloadFlag(prev => !prev);  // Toggle the flag
    }, []);
  
    const contextValue = {
      triggerReload,
      reloadFlag
    }
  
    return (
      <ReloadContext.Provider value={contextValue}>
        {children}
      </ReloadContext.Provider>
    );
  };

export default ReloadContext;