import cookie from 'cookie'
import createAxios from '../utils/createAxios'
import requireAuthentication from '../utils/requireAuthentication'
import dynamic from 'next/dynamic'
import decode from 'jwt-decode'
import { useSelector } from 'react-redux'
import { userActions } from '../redux/user'
import { wrapper } from '../redux/store'
import { createRecord, updateRecord, deleteRecord } from '../frontend/vendor-book/crud'

const AdminDashboardLayout = dynamic(() => import('../components/dashboard'), { ssr: true })

const VendorView = dynamic(() => import('../frontend/vendor-book'))

const Vendor = ({ users }) => {

    const { user } = useSelector(state => state.user)

    return (
        <AdminDashboardLayout>
            <VendorView
                users={users}
                createRecord={createRecord}
                updateRecord={updateRecord}
                deleteRecord={deleteRecord}
                user={user}
            />
        </AdminDashboardLayout>
    )
}

export default Vendor


export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        requireAuthentication(async (context) => {
            const { req, res } = context
            try {
                const axios = createAxios(req.cookies.accessToken)
                const response = await axios.post('/api/vendor/list/')
                store.dispatch(userActions.setUser(decode(req.cookies.accessToken)))
                return {
                    props: {
                        users: response?.data?.data || []
                    }
                }
            } catch (e) {
                res.setHeader('Set-Cookie', cookie.serialize('accessToken', "",
                    {
                        httpOnly: true,
                        expires: new Date(0),
                        sameSite: 'strict',
                        path: '/'
                    }
                ))
                return {
                    redirect: {
                        destination: '/login',
                        statusCode: 302
                    }
                }
            }
        })
)
