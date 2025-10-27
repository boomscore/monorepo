'use client';

import { Alert, AlertIcon, AlertTitle } from './alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SonnerDemo() {
  return (
    <div className="flex gap-6">
      <Button
        variant="outline"
        className="text-green-500"
        size="sm"
        onClick={() =>
          toast.custom(
            t => (
              <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
                <AlertIcon>
                  <CheckCircle />
                </AlertIcon>
                <AlertTitle>This is a success toast</AlertTitle>
              </Alert>
            ),
            {
              duration: 5000,
            },
          )
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        className="text-violet-500"
        size="sm"
        onClick={() =>
          toast.custom(
            t => (
              <Alert variant="mono" icon="info" onClose={() => toast.dismiss(t)}>
                <AlertIcon>
                  <Info />
                </AlertIcon>
                <AlertTitle>This is an info toast</AlertTitle>
              </Alert>
            ),
            {
              duration: 5000,
            },
          )
        }
      >
        Info
      </Button>
      <Button
        variant="outline"
        className="text-yellow-500"
        size="sm"
        onClick={() =>
          toast.custom(
            t => (
              <Alert variant="mono" icon="warning" onClose={() => toast.dismiss(t)}>
                <AlertIcon>
                  <AlertTriangle />
                </AlertIcon>
                <AlertTitle>This is a warning toast</AlertTitle>
              </Alert>
            ),
            {
              duration: 5000,
            },
          )
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        className="text-destructive"
        size="sm"
        onClick={() =>
          toast.custom(
            t => (
              <Alert variant="mono" icon="destructive" onClose={() => toast.dismiss(t)}>
                <AlertIcon>
                  <XCircle />
                </AlertIcon>
                <AlertTitle>This is a destructive toast</AlertTitle>
              </Alert>
            ),
            {
              duration: 5000,
            },
          )
        }
      >
        Destructive
      </Button>
    </div>
  );
}
