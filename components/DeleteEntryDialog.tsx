'use client'

interface DeleteEntryDialogProps {
    isOpen: boolean
    isDeleting: boolean
    onCancel: () => void
    onConfirm: () => void
}

const DeleteEntryDialog = ({
    isOpen,
    isDeleting,
    onCancel,
    onConfirm,
}: DeleteEntryDialogProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                    Delete this entry?
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                    This action cannot be undone.
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteEntryDialog
