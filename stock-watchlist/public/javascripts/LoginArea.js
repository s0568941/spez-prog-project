class LoginArea extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            login: '',
            password: '',
            loginHint: false,
            message: ''
        }
    }

    // CSS Styles:
    welcomeHeadingStyle = {
        textAlign: 'center',
        marginBottom: '-5em',
        marginTop: '1em',
        paddingTop: '2em',
        paddingBottom: '-5em'
    }

    fieldHintStyle = {
        color: 'red',
        fontWeight: 'bold'
    }



    navToRegister = () => {
        this.props.onNavToRegister();
    }

    login = () => {
        const username = this.state.login;
        const password = this.state.password;
        fetch(
            validateLoginRoute,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Csrf-Token': csrfToken
                },
                body: JSON.stringify({
                    username,
                    password
                })
            })
            .then(res => res.json())
            .then(data => {
                this.resetInputFields();
                const loginSucceeded = data['loginSuccess'];
                if (loginSucceeded) {
                    this.props.onLoginSuccess();
                } else {
                    const error = data['error'];
                    this.setState({message: error, loginHint: true})
                    // clear input fields
                    this.resetInputFields();
                }

            });
    }

    onKeyPress = (e) => {
        if (e.key === 'Enter') this.login();
    }

    onChange = (e) => {
        this.setState({ [e.target['id']]: e.target.value });
    }

    resetInputFields = () => {
        // reset input fields
        this.setState(LoginArea.defaultProps);
    }

    render () {
        return (
            <div id="login-area-component">
                <div id="welcome-heading" style={this.welcomeHeadingStyle}>
                    <h1>Welcome to Your Stock Watchlist!</h1>
                </div>

                <div className="wrapper fadeInDown">
                    <div id="formContent">

                        {/*{Icon}*/}
                        <div className="fadeIn first">
                            <img src="https://cdn.borlabs.io/wp-content/uploads/2019/09/blog-wp-login.png" id="icon"
                                 alt="User Icon"/>
                        </div>

                        {/*{!--Login Form --}*/}
                        <div>
                            <input type="text" id="login" className="fadeIn second login-input" placeholder="username"
                                   name="username" onKeyPress={this.onKeyPress}
                                   value={this.state.login} onChange={this.onChange}>
                            </input>
                            <br />
                            <input type="password" id="password" className="fadeIn third login-input" placeholder="password"
                                   name="password" onKeyPress={this.onKeyPress}
                                   value={this.state.password} onChange={this.onChange}>
                            </input>
                            <span style={this.state.loginHint ? this.fieldHintStyle : {}}>
                                {
                                    this.state.loginHint &&
                                    <>
                                        <label>{this.state.message}</label>
                                    </>

                                }
                            </span>
                            <br />
                            <input id="login-btn" type="submit" className="fadeIn fourth"
                                   value="Log In" onClick={this.login}>
                            </input>
                        </div>

                        <div id="formFooter">
                            <a className="underlineHover" onClick={this.navToRegister} href="#">Not registered yet?</a>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}

LoginArea.defaultProps = {
    login: '',
    password: ''
}
