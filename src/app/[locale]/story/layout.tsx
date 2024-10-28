import React, { ReactNode } from "react";

interface StoryLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

const StoryLayout: React.FC<StoryLayoutProps> = ({ children, modal }) => {
  return (
    <>
      {modal}
      {children}
    </>
  );
};

export default StoryLayout;
