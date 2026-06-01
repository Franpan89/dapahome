'use client';

import { deleteSubscriberAction } from '@/app/admin/actions';

export function DeleteSubscriberButton({ id }: { id: string }) {
  return (
    <form
      action={deleteSubscriberAction}
      onSubmit={(e) => {
        if (!confirm('¿Eliminar este suscriptor?')) e.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-2xs text-danger hover:underline">
        Eliminar
      </button>
    </form>
  );
}
