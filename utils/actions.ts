'use server';

import { revalidatePath } from 'next/cache';

export const update = (paths: string[]) => {
    paths.forEach(path => revalidatePath(path))
}
