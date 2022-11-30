import React, { useState } from 'react'
import "./LoginForm.css"
function LoginForm({ closePopup, loginFunc }) {

    const [inputs, setInputs] = useState({
        email: "",
        password: ""
    })

    const handleType = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await loginFunc(inputs)
            closePopup()
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div onClick={(e) => { e.target.id === "loginPopup" && closePopup() }} id="loginPopup" className="loginPopup">
            <form className='form-login-container' onSubmit={handleSubmit}>
                <h1>login</h1>
                <div className='input_container'>
                    <labal> enter your mail</labal>
                    <input required name="email" type="email" placeholder='enter your email' value={inputs.email} onChange={handleType} />
                </div>
                <div className='input_container'>
                    <labal> enter your password</labal>
                    <input required name="password" type="password" placeholder='enter your password' value={inputs.password} onChange={handleType} />
                </div>
                <div>
                    <button type='submit'> Login</button>
                </div>
            </form>
        </div>
    )
}

export default LoginForm