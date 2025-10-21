// src/ui/notify/toast.ts
import { notifications } from '@mantine/notifications';
import { Check, Info, X, AlertCircle,  } from 'lucide-react';
import type { ReactNode } from 'react';
import StyleModule from './ToastMantine.module.css';

type ToastOpts = {
    id?: string;              // úsalo para poder actualizar/deduplicar
    title?: string;
    message: ReactNode;
    autoClose?: number;
};

const defaults = {
    autoClose: 2500,
} satisfies Partial<Parameters<typeof notifications.show>[0]>;

const ToastMantine = {
    success: (o: ToastOpts) =>
        notifications.show({
            ...defaults,
            id: o.id,
            color: 'green',
            title: o.title ?? 'Listo',
            message: o.message,
            icon: <Check />,
            classNames: {
                root: StyleModule.successToast,
                closeButton: StyleModule.successCloseButton,
                title: `${StyleModule.successTitle} nunito-bold`,
                description: StyleModule.successDescription,
                icon: StyleModule.successIcon,
                body: StyleModule.successBody,
                loader: StyleModule.successLoader,
            }
        }),
    feedBackForm: (o: ToastOpts) =>
        notifications.show({
            ...defaults,
            id: o.id,
            title: `Acción requerida`,
            color: `var(--color-warning)`,
            message: o.message,
            icon: <AlertCircle />,
            classNames: {
                root: StyleModule.feedBackFormToast,
                closeButton: StyleModule.feedBackFormCloseButton,
                title: `${StyleModule.feedBackFormTitle} nunito-bold`,
                description: StyleModule.feedBackFormDescription,
                icon: StyleModule.feedBackFormIcon,
                body: StyleModule.feedBackFormBody,
                loader: StyleModule.feedBackFormLoader,
            }
        }),

    error: (o: ToastOpts) =>
        notifications.show({
            ...defaults,
            id: o.id,
            color: 'red',
            title: o.title ?? 'Error',
            message: o.message,
            icon: <X />,
        }),

    info: (o: ToastOpts) =>
        notifications.show({
            ...defaults,
            id: o.id,
            color: 'blue',
            title: o.title ?? 'Aviso',
            message: o.message,
            icon: <Info />,
        }),

    // Patrones de "progreso → resultado"
    loading: (id: string, msg = 'Procesando…') =>
        notifications.show({
            ...defaults,
            id,
            loading: true,
            title: 'Procesando',
            message: msg,
            autoClose: false,
            withCloseButton: false,
        }),

    ok: (id: string, msg = 'Completado') =>
        notifications.update({
            id,
            loading: false,
            color: 'green',
            title: 'Listo',
            message: msg,
            autoClose: 2000,
            withCloseButton: true,
        }),

    fail: (id: string, msg = 'Ocurrió un error') =>
        notifications.update({
            id,
            loading: false,
            color: 'red',
            title: 'Error',
            message: msg,
            autoClose: 4000,
            withCloseButton: true,
        }),

    dismiss: (id: string) => notifications.hide(id),
    clear: () => notifications.clean(),
};

export default ToastMantine;


/* Como se usaria */
/*

import { toast } from '@/ui/notify/toast';

toast.success({ message: 'Cambios guardados' });
toast.error({ message: 'No se pudo guardar' });

*/ 