

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    return ( 
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 dark:from-gray-900 dark:via-violet-950 dark:to-indigo-950 flex items-center justify-center p-6 relative">
            {/* Colorful floating elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-violet-200/30 to-purple-300/20 dark:from-violet-500/15 dark:to-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-blue-200/30 to-cyan-300/20 dark:from-blue-500/15 dark:to-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-emerald-200/20 to-teal-300/15 dark:from-emerald-500/10 dark:to-teal-500/8 rounded-full blur-3xl"></div>
            </div>
            
            {/* Additional accent colors */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-200/25 to-rose-300/20 dark:from-pink-500/12 dark:to-rose-500/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tr from-amber-200/25 to-orange-300/20 dark:from-amber-500/12 dark:to-orange-500/10 rounded-full blur-2xl"></div>
            </div>
            
            <div className="w-full max-w-md relative z-10">
                {children}
            </div>
        </div>
    );
}
 
export default Layout;