import { redirect } from 'next/navigation'
import { getCurrentAppUser } from '@/utils/auth'

const createNewUser = async () => {
    await getCurrentAppUser()
    redirect('/journal')
}

const NewUser = async () => {
    await createNewUser()
    return <div>...loading</div>
}

export default NewUser
