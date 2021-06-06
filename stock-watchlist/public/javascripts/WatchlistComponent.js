/**
 * This component comes from the following source:
 * https://github.com/MattDobsonWeb/movie-watchlist-react
 * Slight modifications have been made
 */
class WatchlistComponent extends React.Component {
    constructor(props){
        super(props);
    }

    async componentDidMount() {
        await this.props.refreshWatchlist();
    }

    render() {

        return (
            <div className="movie-page">
                <div className="container">
                    <div className="header">
                        <h1 className="heading">My Watchlist</h1>

                        <span className="count-pill">
            {this.props.watchlist.length} {this.props.watchlist.length === 1 ? "Stock" : "Stocks"}
          </span>
                    </div>

                    {this.props.watchlist.length > 0 ? (
                        <div className="movie-grid">
                            {this.props.watchlist.map((stock) => (
                                <StockLogoComponent
                                    onRemoveFromWatchlist={(stock) => this.props.onRemoveFromWatchlist(stock.text)}
                                    onNavToNewsPage={(stock) => this.props.onNavToNewsPage(stock)}
                                    refreshWatchlist={() => this.props.refreshWatchlist()}
                                    stock={stock} key={stock.id} type="watchlist" />

                            ))}
                        </div>
                    ) : (
                        <h2 className="no-movies">No stocks in your list! Add some and come back for the latest news!</h2>
                    )}
                </div>
            </div>
        );

    }

}