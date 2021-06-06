//routes:
const validateLoginRoute = document.getElementById('validateLoginRoute').value;
const validateRegisterRoute = document.getElementById('validateRegisterRoute').value;
const authStatusRoute = document.getElementById('authStatusRoute').value;
const loadAppDataRoute = document.getElementById('loadAppDataRoute').value;
const loadWatchlistRoute = document.getElementById('loadWatchlistRoute').value;
const receiveTodaysNewsRoute = document.getElementById('receiveTodaysNewsRoute').value;
const saveTodaysNewsRoute = document.getElementById('saveTodaysNewsRoute').value;
const addToWatchlistRoute = document.getElementById('addToWatchlistRoute').value;
const removeFromWatchlistRoute = document.getElementById('removeFromWatchlistRoute').value;
const csrfToken = document.getElementById('csrfToken').value;

// API Key:
const NEWSAPI_API_KEY = 'af604637cfee418c90139c0f38a49683';
const NEWSAPI_API_KEY_V2 = 'd95ec60efb30400698e7011d84606ef0';


// StockWatchlist Component - Start
class StockWatchlist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            registerView: false,
            loginView: false,
            addView: false,
            watchlistView: true,
            newsView: false,
            stocks: [],
            watchlist: [],
            news: [],
            newsPageContent: []
        }
    }


    loadAppData = async() => {
        await fetch(loadAppDataRoute)
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                this.setState({stocks: JSON.parse(data.stocks[0].text)});

            });
    }

    loadWatchlist = async () => {
        await fetch(loadWatchlistRoute)
            .then(res => res.json())
            .then(data => {
                if (data.loadSuccess)
                    this.setState({watchlist: data.stocks});
            });
    }

    // deactivated as news api does not allow fetch via heroku
    saveTodaysNews = async(todaysNews) => {
        if (false) {
            const todaysDate = new Date()
            const dateString = todaysDate.toISOString().split('T')[0]
            // POST request to store stock in DB
            const saveNews = JSON.stringify(todaysNews).replaceAll("^", "");
            const success = await fetch(
                saveTodaysNewsRoute,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Csrf-Token': csrfToken
                    },
                    body: saveNews
                })
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        this.setState({watchlist: [...this.state.watchlist, stock]});
                        this.loadWatchlist();
                    }
                    return data;
                }).catch(err => console.log(err));
            return success;
        }
    }

    receiveTodaysNews = async() => {
        //fetch
        // if empty -> fetch for all stocks
        const newsFromDB = await fetch(receiveTodaysNewsRoute)
            .then(res => res.json())
            .then(data => {

                if (data.length > 0) {
                    // set State with news
                    // console.log("True");
                    const collectedNews = data.map(entry => JSON.parse(entry.news));
                    const microsoft = collectedNews.filter(news => Object.keys(news).indexOf("Microsoft") !== -1);
                    this.setState({news: collectedNews});
                    return true;
                } else {
                    // return false and fetch news
                    return false;
                }

            });
        // news api does not allow fetching from heroku
        if (false) {
            let newsOfStocks = {};
            for (const stock of this.state.stocks) {
                const data = await fetch(
                    `https://newsapi.org/v2/everything?q=${stock}&sortBy=publishedAt&apiKey=${NEWSAPI_API_KEY}`

                )
                    .then((res) => res.json())
                    .then((data) => {

                        let newsOfStock = {};
                        newsOfStock[stock] = data;
                        newsOfStocks[stock] = data;
                        return newsOfStock;

                    }).catch(e => console.log(e));

                // CORS limitation does not allow to fetch news from heroku
                // await this.saveTodaysNews(data);

            }
            // after
            await this.receiveTodaysNews();

            /**
             * Final results:
             * {Amazon: {…}, DoorDash: {…}, Pepsi: {…}, Facebook: {…}, Netflix: {…}}
             Amazon: {status: "ok", totalResults: 74808, articles: Array(20)}
             DoorDash: {status: "ok", totalResults: 994, articles: Array(20)}
             Facebook:
             articles: (20) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
             status: "ok"
             totalResults: 99359
             __proto__: Object
             Netflix: {status: "ok", totalResults: 30409, articles: Array(20)}
             Pepsi: {status: "ok", totalResults: 844, arfnewsticles: Array(20)}
             __proto__: Object
             */

            // await this.saveTodaysNews(newsOfStocks);
            this.setState({news: newsOfStocks});

        }
    }

    // checks if session exists to display correct component after refresh of page
    renderByAuthStatus = () => {
        fetch(authStatusRoute)
            .then(res => res.json())
            .then(data => {
                const loggedIn = data['loggedIn'];
                if (loggedIn && !this.state.loggedIn) {
                    this.setState({...StockWatchlist.defaultProps, ...this.state.watchlist, loggedIn: true})
                }
            });
    }

    async componentDidMount() {
        this.renderByAuthStatus();
        if (this.state.stocks.length === 0)
            await this.loadAppData();
        if (this.state.news.length === 0)
            await this.receiveTodaysNews();
        // if (this.state.watchlist.length === 0)
        //     await this.loadWatchlist();
    }

    // adds stock to watchlist and database
    onAddToWatchlist = async(stock) => {
        // POST request to store stock in DB
        const success = await fetch(
            addToWatchlistRoute,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Csrf-Token': csrfToken
                },
                body: JSON.stringify(stock)
            })
            .then(res => res.json())
            .then(data => {
                if (data) {
                    this.setState({watchlist: [...this.state.watchlist, stock]});
                    this.loadWatchlist();
                }
                return data;
            });
        return success;
    }

    onRemoveFromWatchlist = async(stock) => {
        const stockToRemove = this.state.watchlist.filter(stocks => stocks.text === stock);
        const stockId = stockToRemove[0].id;


        // POST request to remove stock from DB
        const success = await fetch(
            removeFromWatchlistRoute,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Csrf-Token': csrfToken
                },
                body: JSON.stringify(stockId)
            })
            .then(res => res.json())
            .then(data => {
                if (data) {
                    this.loadWatchlist();
                }
                return data;
            });
        return success;
    }

    onNavToNewsPage = (stock) => {
        const stockNews = this.state.news.filter(news => Object.keys(news).indexOf(stock.text) !== -1);
        this.setState({...StockWatchlist.defaultProps, loggedIn: true, watchlistView: false, newsView: true, newsPageContent: stockNews})


    }

    render() {
        if (this.state.loggedIn) {
            // remove background color from authentication area
            document.getElementsByTagName('html')[0].style.backgroundColor = "white";
            return (
                <>
                    <HeaderComponent
                        onNavToAdd={() => this.setState({...StockWatchlist.defaultProps, loggedIn: true, watchlistView: false, addView: true})}
                        onNavToWatchlist={() => this.setState({...StockWatchlist.defaultProps, loggedIn: true, watchlistView: true})}
                    />
                    {
                        this.state.newsView && this.state.newsPageContent.length > 0 && (
                            <NewsComponent
                                news={this.state.newsPageContent}
                                stock={"Tesla"}
                            />
                        )
                    }
                    {
                        this.state.watchlistView && this.state.stocks.length > 0 && (
                            <WatchlistComponent
                                onAddToWatchlist={(stock) => this.onAddToWatchlist(stock)}
                                onRemoveFromWatchlist={(stock) => this.onRemoveFromWatchlist(stock)}
                                onNavToNewsPage={(stock) => this.onNavToNewsPage(stock)}
                                refreshWatchlist={() => this.loadWatchlist()}
                                watchlist={this.state.watchlist}
                                news={this.state.news}
                                stocks={this.state.stocks} />
                        )}

                    {
                        this.state.addView && this.state.news.length > 0 && (
                        <AddComponent
                            onAddToWatchlist={(stock) => this.onAddToWatchlist(stock)}
                            onRemoveFromWatchlist={(stock) => this.onRemoveFromWatchlist(stock)}
                            refreshWatchlist={() => this.loadWatchlist()}
                            watchlist={this.state.watchlist}
                            news={this.state.news}
                            stocks={this.state.stocks} />
                    )}

                </>
            )
        } else if (this.state.registerView) {
            // document.getElementsByTagName('html')[0].style.backgroundColor = "#56baed";
            return <RegisterArea onNavToLogin={() => this.setState({...StockWatchlist.defaultProps, loginView: true})} />
        } else {
            // document.getElementsByTagName('html')[0].style.backgroundColor = "#56baed";
            return <LoginArea
                onLoginSuccess={() => this.setState({...StockWatchlist.defaultProps, loggedIn: true})}
                onNavToRegister={() => this.setState({...StockWatchlist.defaultProps, registerView: true})} />
        }
    }
}

StockWatchlist.defaultProps = {
    loggedIn: false,
    registerView: false,
    loginView: false,
    addView: false,
    watchlistView: true,
    newsView: false
}
// StockWatchlist Component - End





ReactDOM.render(
    <StockWatchlist />,
    document.getElementById('root')
);
