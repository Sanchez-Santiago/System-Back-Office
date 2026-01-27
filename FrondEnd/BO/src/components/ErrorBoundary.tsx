// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode, ComponentProps } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';


interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps extends ComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      error: null, 
      errorInfo: null, 
      hasError: false, 
      errorId: '', 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🔍 ErrorBoundary: Error capturado:', error);
    
    // Extraer información del error
    const errorInfo = {
      componentStack: error.stack || 'No stack available',
      error: error.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      memory: (performance as any).memory,
    };

    return {
      error,
      errorInfo,
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9),
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔍 ErrorBoundary: Error capturado en:', error);
    console.error('🔍 ErrorBoundary: Stack trace:', error.stack);
    
    // Solo establecer el error una vez para evitar ciclos de errores
    if (!this.state.hasError) {
      this.setState({
        error,
        errorInfo,
        hasError: true,
        errorId: Math.random().toString(36).substr(2, 9),
        retryCount: 0,
      });
    }
  }

  handleRetry = () => {
    this.setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      hasError: false,
      error: null,
      errorInfo: null,
    }));
  };

  handleReset = () => {
    this.setState({
      error: null,
      errorInfo: null,
      hasError: false,
      errorId: '',
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      console.log('🔍 ErrorBoundary: Renderizando UI de error');
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Crítico Detectado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-red-600 mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-lg font-semibold text-red-900">¡Ups! Algo salió mal</h3>
              </div>
              
              <div className="text-center text-gray-600 mb-4">
                <p className="text-sm">La aplicación encontró un error inesperado.</p>
                <p className="text-xs">Por favor, recarga la página o contacte al equipo técnico si el problema persiste.</p>
              </div>

              {this.state.errorInfo?.componentStack && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-semibold text-red-800 mb-2">Información del Error:</h4>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-x-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="bg-blue-50 border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-800 mb-2">Detalles Técnicos:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Error:</strong> {this.state.error?.message || 'Error desconocido'}</p>
                  <p><strong>Componente:</strong> {this.state.errorInfo?.componentStack}</p>
                  <p><strong>Timestamp:</strong> {this.state.errorInfo?.timestamp}</p>
                  <p><strong>URL:</strong> {this.state.errorInfo?.url}</p>
                  <p><strong>Retry Count:</strong> {this.state.retryCount}</p>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  🔄 Reintentar
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 text-gray-700"
                >
                  🔄 Recargar Página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente de Error Boundary específico para autenticación
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error de Autenticación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-yellow-600 mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-lg font-semibold text-yellow-900">Error en Autenticación</h3>
              </div>
              
              <div className="text-center text-gray-600 mb-4">
                <p className="text-sm">Hubo un problema durante el proceso de inicio de sesión.</p>
                <p className="text-xs">Por favor, verifica tus credenciales e vuelve a intentarlo.</p>
              </div>
              
              <div className="flex justify-center gap-3 mt-6">
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  🔄 Reintentar Login
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 text-gray-700"
                >
                  🏠 Volver al Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Componente de Error Boundary para problemas de carga
export function LoadingErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Error de Carga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-blue-600 mb-4">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-900">Problema al Cargar</h3>
              </div>
              
              <div className="text-center text-gray-600 mb-4">
                <p className="text-sm">Hubo un problema al cargar los datos.</p>
                <p className="text-xs">Por favor, espere un momento y recarge la página.</p>
              </div>
              
              <div className="flex justify-center gap-3 mt-6">
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  🔄 Recargar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;