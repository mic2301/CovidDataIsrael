const {
    ButtonGroup, Button, Icon, Grid, IconButton, CircularProgress
} = MaterialUI;

let sheetname = new URL(window.location.href).searchParams.get("sheet");
sheetname = sheetname || 'showcharts';
console.log(sheetname);

const ShowByName = ({ name, names, lang }) => {
    // if (name === 'all') return <DataShowRaw fileshow={'out/covid.csv'} />
    if (name === 'showcharts') return <DataShowCharts names={names} lang={lang} />
    if (name === 'infectedVsDead') return <DataShowComputedDeath showtable={true} lang={lang} />
    return <DataShow name={name} lang={lang} />
}

const trans = (lang, text) => {
    if (!lang) return '';
    if (lang[text]) return lang[text];
    const nospaces = lang[text.replace(/[ _]/g, '')];
    if (lang[nospaces]) return lang[nospaces];
    return text;
}

const App = ({ name }) => {
    const [names, setNames] = React.useState({ names: [], work: true });
    const [lastUpdate, setLastUpdate] = React.useState('...');
    const [language, setLanguage] = React.useState('he');
    const [languages, setLanguages] = React.useState({});
    React.useEffect(() => {
        (async () => {
            setLanguages(await (await fetch('jsons/lang.json')).json());

            const response = await fetch('jsons/dashreq.json');
            const json = await response.json();
            let newnames = json.requests.map(j => j.queryName);
            setNames({ names: newnames, work: true });

            const response2 = await fetch('jsons/dashcomputed.json');
            const json2 = await response2.json();
            newnames = newnames.concat(json2)

            const response3 = await fetch('jsons/mohfiles.json');
            const json3 = await response3.json();
            const mohnames = json3.map(r => r.name);
            newnames = newnames.concat(mohnames)

            setNames({ names: newnames, work: false });
            // console.log(newnames);
        })();
    }, []);

    (async () => {
        const last = await fetchCsv(`out/csv/lastUpdate.csv`);
        if (last && last.length && last[0].lastUpdate) {
            setLastUpdate(last[0].lastUpdate.toLocaleString());
        }
    })();

    const lang = languages[language];

    return <>
        <Grid container direction="row">
            <Grid item xs={3}>
                <Grid container direction="row" justify="flex-start" alignItems="center">
                    <IconButton onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}>
                        <img width={32} height={32} src={`images/${language === 'he' ? 'il' : 'gb'}.svg`}></img>
                    </IconButton>
                    <p style={{
                        fontFamily: 'Source Sans Pro, sans-serif',
                        textAlign: 'left',
                    }}>
                        {trans(lang, 'lastUpdate')}<br />
                        {lastUpdate}
                    </p>
                </Grid>
            </Grid>
            <Grid item xs={6}>
                <h1 style={{
                    // fontFamily: 'Source Sans Pro, sans-serif',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    textAlign: 'center',
                    fontSize: 'xx-large'
                }}>
                    {trans(lang, 'Covid-19 Data Israel')}
                </h1>
            </Grid>
            <Grid item xs={3}>
                <a href="https://eran.dev/" style={{ textDecoration: 'none' }}>
                    <p style={{
                        fontFamily: 'Source Sans Pro, sans-serif',
                        textAlign: 'right',
                        marginRight: 10
                    }}>
                        {trans(lang, 'Contact')}
                    </p>
                </a>
            </Grid>
        </Grid>
        <Grid container direction="row">
            <Grid item xs={3}>
                <CsvButtons names={names.names} lang={lang} />
                <CircularWorkGif work={names.work} />
            </Grid>
            <Grid item xs={9}>
                <ShowByName name={name} names={names.names} lang={lang} />
            </Grid>
        </Grid>
        <p style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            textAlign: 'center',
        }}>
            Updated hourly from the&nbsp;
            <a href='https://www.health.gov.il/English/Pages/HomePage.aspx' style={{ textDecoration: 'none' }}>
                public API of Ministry of Health of Israel
            </a>
            <br />
            Created by&nbsp;
             <a href="https://eran.dev/" style={{ textDecoration: 'none' }}>
                © Eran Geva
            </a>
            &nbsp;as&nbsp;
            <a href='https://github.com/erasta/CovidDataIsrael' style={{ textDecoration: 'none' }}>
                open-source code
            </a>
        </p>
    </>
}

ReactDOM.render(
    <App name={sheetname} />,
    document.getElementById('root')
);
