
//routes:
const validateLoginRoute = document.getElementById('validateLoginRoute').value;
const validateRegisterRoute = document.getElementById('validateRegisterRoute').value;
const authStatusRoute = document.getElementById('authStatusRoute').value;
const csrfToken = document.getElementById('csrfToken').value;

// components
const loginArea = document.getElementById('login-area');
const registerArea = document.getElementById('register-area');
const welcomeArea = document.getElementById('welcome-area');

function hideComponent(component) {
    component.style.display = 'none';
}

function displayComponent(component) {
    component.style.display = 'initial';
    component.style.height = '100%';
}


/**
 * handles submission of form data
 * @param formClass class of element
 * @param submitBtnId id of submit button / element
 */
const formEventHandler = (formClass, submitBtnId) => {
    document.addEventListener('keypress', event => {
        if (event.target.classList.contains(formClass)) {
            if (event.key === 'Enter') document.getElementById(submitBtnId).click();
        }
    });
}


// handle login form:
formEventHandler('login-input', 'login-btn');
// handle register form:s
formEventHandler('register-input', 'register-btn');

function renderByAuthStatus() {
    fetch(authStatusRoute)
        .then(res => res.json())
        .then(data => {
            const loggedIn = data['loggedIn'];
            if (loggedIn) {
                hideComponent(loginArea);
                hideComponent(registerArea);
                displayComponent(welcomeArea);
            }
        });
}

renderByAuthStatus();

function login() {
    const username = document.getElementById('login').value;
    const password = document.getElementById('password').value;
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
            console.log(data);
            const loginSucceeded = data['loginSuccess'];
            if (loginSucceeded) {
                hideComponent(loginArea);
                displayComponent(welcomeArea);
            } else {
                const error = data['error'];
                alert(error);
            }
        });
}

function handleFormFieldRequiredError(data) {
    console.log(data['fieldRequiredError']);
    alert(
        JSON.stringify(
            Object.keys(data['fieldRequiredError']).map((key, value) => {
                if (key === "username") {
                    //TODO: this needs to go into a div or span
                    return "The field username is required";
                } else if (key === "password") {
                    return "The field password is required";
                } else {
                    return "The field confirm password is required";
                }
            }), null, 4
        )
    );
}

function register() {
    const username = document.getElementById('register-user').value;
    const password = document.getElementById('register-pw').value;
    const confPassword = document.getElementById('register-pw-confirm').value;
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
                hideComponent(registerArea);
                displayComponent(loginArea);
            } else if (data['fieldRequiredError']) {
                handleFormFieldRequiredError(data);
            } else if (data['passwordMatchError']) {
                alert("The passwords you entered do not match.");
            } else if (data['userExists']) {
                alert("The username you entered is already taken.");

            }
        });
}


function navToLogin() {
    hideComponent(registerArea);
    displayComponent(loginArea);
}

function navToRegister() {
    hideComponent(loginArea);
    displayComponent(registerArea);
}
