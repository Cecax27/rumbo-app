import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Borrar cuenta",
    description: "Instrucciones para eliminar tu cuenta y datos asociados.",
};

export default function DeleteAccountPage() {
    return (
        <article className="space-y-6">
            <header>
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Borrar cuenta</h2>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                    Aquí encontrarás las instrucciones para eliminar tu cuenta y todos los datos asociados de manera segura y definitiva.
                </p>
            </header>

            <section className="space-y-3">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">¿Qué sucede al borrar tu cuenta?</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                    Al borrar tu cuenta, se eliminarán todos tus datos personales, configuraciones y registros de actividad de manera permanente. Esta acción no se puede deshacer, así que asegúrate de estar completamente seguro antes de proceder.
                </p>
                <p className="text-neutral-700 dark:text-neutral-300">
                    Después de eliminar tu cuenta, Rumbo no almacenará ningún dato relacionado contigo, y no podrás recuperar ningún historial o configuración previa.
                </p>
            </section>

            <section className="space-y-3">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Proceso de eliminación</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                    Envía un correo electrónico a <a href="mailto:carlos27.10.98@gmail.com?subject=Solicitud%20de%20eliminación%20de%20cuenta%20en%20Rumbo&body=Hola%20Carlos,%0A%0AQuiero%20solicitar%20la%20eliminación%20de%20mi%20cuenta%20en%20Rumbo. %0A%0AGracias!" className="text-blue-600 hover:underline">carlos27.10.98@gmail.com</a> con el asunto "Solicitud de eliminación de cuenta en Rumbo" para que podamos procesar tu solicitud de manera segura. Sólo se aceptarán solicitudes de eliminación de cuenta cuando se envíen desde la dirección de correo electrónico asociada a la cuenta que deseas eliminar, para garantizar la seguridad y privacidad de los usuarios.
                </p>
                <p className="text-neutral-700 dark:text-neutral-300">
                    Una vez recibida tu solicitud, procesaremos la eliminación de tu cuenta en un plazo de 7 días hábiles. Recibirás una confirmación por correo electrónico una vez que tu cuenta haya sido eliminada.
                </p>
            </section>
        </article>
    );
}