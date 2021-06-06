/**
 * This component comes from the following source:
 * https://github.com/MattDobsonWeb/movie-watchlist-react
 * Slight modifications have been made
 */
class HeaderComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <header>
                <div className="container">
                    <div className="inner-content">
                        <div className="brand">
                            <div id="banner">Stock Watchlist</div>
                        </div>

                        <ul className="nav-links">
                            <li>
                                <button
                                    onClick={() => this.props.onNavToAdd()}
                                    className="btn btn-main">
                                    + Add
                                </button>
                            </li>

                            <li>
                                <button
                                    onClick={() => this.props.onNavToWatchlist()}
                                >Watch List</button>
                            </li>

                            <li>
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href='/logout';
                                }} >Logout</button>
                            </li>


                        </ul>
                    </div>
                </div>
            </header>
        );
    }
}
