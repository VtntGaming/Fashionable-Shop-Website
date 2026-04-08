interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export default function Container({ children, className = '', narrow }: ContainerProps) {
  return (
    <div className={`w-[90%] mx-auto ${narrow ? 'max-w-4xl' : 'max-w-screen-xl 2xl:max-w-screen-2xl'} ${className}`}>
      {children}
    </div>
  );
}
