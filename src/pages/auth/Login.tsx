

const Login = () => {
    return (
        <div>
            <h1>Login Page</h1>
            <form action="">
                <input type="text" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <input type="checkbox" name="rememberMe" id="rememberMe" />
                <label htmlFor="rememberMe">Remember Me</label>
                <button type="submit">Login</button>
                <br />
                <button>Continue with Google</button>
                <br />
                <button>Continue with Facebook</button>
                <br />
            </form>
            <div className='flex items-center gap-2'>
                <p>Don't have an account?</p>
                <button>Register</button>
            </div>
        </div>
    )
}

export default Login