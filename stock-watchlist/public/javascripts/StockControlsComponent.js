/**
 * This component comes from the following source:
 * https://github.com/MattDobsonWeb/movie-watchlist-react
 * Slight modifications have been made
 */
class StockControlsComponent extends React.Component {
    constructor(props) {
        super(props);

    }

    removeFromWatchlist = async(stock) => {
        const success = await this.props.onRemoveFromWatchlist(stock);
        if (success)
            // this.setState({inWatchlist: false});
            await this.props.refreshWatchlist();
        else
            console.log("Failed");
    }

    navToNews = (stock) => {
        this.props.onNavToNewsPage(stock);
    }

    render() {
        return (

                <div className="inner-card-controls">
                    <button className="ctrl-btn" onClick={() => this.navToNews(this.props.stock)}>
                        <i className="fa-fw far fa-eye" />
                    </button>

                    <button
                        className="ctrl-btn"
                        onClick={() => this.removeFromWatchlist(this.props.stock)}
                    >
                        <i className="fa-fw fa fa-times" />
                    </button>
                </div>

        );
    }

}