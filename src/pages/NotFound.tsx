import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '@/components/ui/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg">
            <Home className="mr-2 w-5 h-5" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
