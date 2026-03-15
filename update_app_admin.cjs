const fs = require('fs');

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const adminEventListener = `
    useEffect(() => {
      const handleAdminCommand = (payload: any) => {
        if (payload.actionType === 'end_game') {
          setActiveGame(null);
        }
      };

      socket.on('admin_event', handleAdminCommand);

      return () => {
        socket.off('admin_event', handleAdminCommand);
      };
    }, []);
`;

if (!content.includes("handleAdminCommand")) {
  content = content.replace(
    /const navigate = useNavigate\(\);\n\s*const location = useLocation\(\);/,
    "const navigate = useNavigate();\n    const location = useLocation();\n" + adminEventListener
  );
  
  fs.writeFileSync(file, content);
  console.log('App.tsx updated');
} else {
  console.log('App.tsx already updated');
}
