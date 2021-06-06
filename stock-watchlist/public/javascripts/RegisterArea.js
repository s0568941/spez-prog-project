class RegisterArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            confPassword: '',
            usernameHint: false,
            passwordHint: false,
            confPasswordHint: false
        }
    }

    // CSS Styles:
    welcomeHeadingStyle = {
        textAlign: 'center',
        marginBottom: '5em',
        marginTop: '1em',
        paddingTop: '2em',
        paddingBottom: '-5em'
    }

    fieldHintStyle = {
        color: 'red',
        fontWeight: 'bold'
    }

    navToLogin = () => {
        this.props.onNavToLogin();
    }

    resetInputFields = () => {
        // reset input fields
        this.setState(RegisterArea.defaultProps);
    }

    resetHints = () => {
        this.setState({
            usernameHint: false,
            passwordHint: false,
            confPasswordHint: false
        })
    }

    register = () => {
        const username = this.state.username;
        const password = this.state.password;
        const confPassword = this.state.confPassword;
        fetch(
            validateRegisterRoute,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Csrf-Token': csrfToken
                },
                body: JSON.stringify({
                    username,
                    password,
                    confPassword,
                })
            })
            .then(res => res.json())
            .then(data => {
                const registerSucceeded = data['registerSuccess'];
                if (registerSucceeded) {
                    console.log('Register succeeded');
                    this.props.onNavToLogin();
                } else if (typeof data['fieldRequiredError'] !== "undefined" && data['fieldRequiredError'].length > 0) {
                    this.resetHints();
                    Object.keys(data['fieldRequiredError']).forEach(
                        (k) => {
                            if (k === "username") {
                                //TODO: this needs to go into a div or span
                                this.setState({usernameHint: true});
                            } else if (k === "password") {
                                this.setState({passwordHint: true});
                            } else {
                                this.setState({confPasswordHint: true});
                            }
                        }
                    );
                } else if (typeof data['fieldLengthError'] !== "undefined" && data['fieldLengthError'].length > 0) {
                    this.resetHints();
                    data['fieldLengthError'].forEach( error => {
                        if (error['field'] === "username") {
                            this.setState({usernameHint: true});
                        } else if (error['field'] === "password") {
                            this.setState({passwordHint: true});
                        } else {
                            this.setState({confPasswordHint: true});
                        }
                    });
                } else if (data['passwordMatchError']) {
                    this.resetHints();
                    alert("The passwords you entered do not match.");
                } else if (data['userExists']) {
                    this.resetHints();
                    alert("The username you entered is already taken.");
                    this.resetInputFields();
                }
            });
    }

    onKeyPress = (e) => {
        if (e.key === 'Enter') this.register();
    }

    onChange = (e) => {
        this.setState({ [e.target['name']]: e.target.value });
    }

    render() {
        return (
            <div id="register-area">

                <div
                    style={this.welcomeHeadingStyle}>
                    <h1>Welcome to Your Stock Watchlist!</h1>
                </div>

                {/*@* Source of bootstrap snippet: https://bootsnipp.com/snippets/dldxB*@*/}
                <div className="wrapper fadeInDown">
                    <div id="formContent">

                        {/*{!--Icon--}*/}
                        <div className="fadeIn first">
                            <img src="https://cdn.borlabs.io/wp-content/uploads/2019/09/blog-wp-login.png" id="icon"
                                 alt="User Icon"/>
                        </div>
                        <div>
                            <input type="text" id="registerUser" className="fadeIn second register-input" placeholder="username"
                                   name="username" onKeyPress={this.onKeyPress}
                                   value={this.state.username} onChange={this.onChange}>
                            </input>
                            <span style={this.state.usernameHint ? this.fieldHintStyle : {}}>
                                {
                                    this.state.usernameHint &&
                                    <>
                                        <label>This field is required.</label><br />
                                    </>

                                }
                                <label>Minimum length: 3</label>
                                <br />
                                <label>Maximum length: 20</label>
                            </span>
                            <br />
                            <input type="password" id="register-pw" className="fadeIn third register-input" placeholder="password"
                                   name="password" onKeyPress={this.onKeyPress}
                                   value={this.state.password} onChange={this.onChange}>
                            </input>
                            <span style={this.state.passwordHint ? this.fieldHintStyle : {}}>
                               {
                                   this.state.passwordHint &&
                                   <>
                                       <label>This field is required.</label><br />
                                   </>

                               }
                                <label>Minimum length: 5</label>
                            </span>
                            <br />
                            <input type="password" id="register-pw-confirm" className="fadeIn third register-input" placeholder="confirm password"
                                   name="confPassword" onKeyPress={this.onKeyPress}
                                   value={this.state.confPassword} onChange={this.onChange}>
                            </input>
                            <span style={this.state.confPasswordHint ? this.fieldHintStyle : {}}>
                               {
                                   this.state.confPasswordHint &&
                                   <>
                                       <label>This field is required.</label><br />
                                   </>

                               }
                                <label>Minimum length: 5</label>
                            </span>
                            <br />
                            <hr />
                        </div>

                        <div>
                            <input id="register-btn" type="submit" className="fadeIn fourth"
                                   value="Register" onClick={this.register}>
                            </input>
                        </div>

                        <div id="formFooter">
                            <a className="underlineHover" onClick={this.navToLogin} href="#">Already
                                registered?</a>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}

RegisterArea.defaultProps = {
    username: '',
    password: '',
    confPassword: ''
}
