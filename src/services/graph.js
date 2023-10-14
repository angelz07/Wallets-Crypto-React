import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryTooltip, VictoryScatter ,VictoryLabel  } from 'victory';


export function capitalizeFirstLetter(str) {
    // Vérifie si la chaîne est vide ou null
    if (!str) return str;

    // Convertit la première lettre en majuscule et le reste en minuscule
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatDate(isoDate) {
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

export function formatAxisDate(dateStr, displayYear) {
    const date = new Date(dateStr);
    const dayMonth = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  //  console.log("formatAxisDate -> Date:", dateStr, "DisplayYear:", displayYear, "Formatted:", displayYear ? date.getFullYear().toString() : dayMonth); // Ajoutez cette ligne
    return displayYear ? date.getFullYear().toString() : dayMonth;
}


export const determineColor = (input) => {
    const datum = input.datum; // accédez à la propriété 'datum'
    if (datum.sales && datum.sales.length > 0 && datum.buys && datum.buys.length > 0) {
        return "orange";
    } else if (datum.sales && datum.sales.length > 0) {
        return "red";
    } else if (datum.buys && datum.buys.length > 0) {
        return "green";
    } else {
        return "gray";
    }
};

export const PortfolioGraph = ({ data }) => {
    const dynamicPointSize = data.length > 50 ? 3 : data.length > 30 ? 4 : 5; // Exemple de dimensionnement dynamique

    return (
        <VictoryChart 
            theme={VictoryTheme.material}
            
            width={800} 
            height={300}
            padding={{ top: 10, right: 50, bottom: 60, left: 50 }}
            >
            <VictoryAxis
                tickValues={data.map(d => d.date)}  // <-- Ajout de cette ligne
                gridComponent={<></>}
                tickLabelComponent={
                    <VictoryLabel 
                        angle={90} 
                        verticalAnchor="middle" 
                        textAnchor="start" 
                    />
                }
                tickFormat={(t) => {
                    const dataPoint = data.find(d => d.date === t);
                    return dataPoint ? formatAxisDate(t, dataPoint.displayYear) : "";
                }}
                style={{
                    ticks: {stroke: "grey", size: 5},
                    tickLabels: {
                        fontSize: 11,
                        padding: 5,
                        fill: (t) => {
                            const tickDateString = t.tick; // Accédez à la propriété tick de l'objet t
                            const tickDate = new Date(tickDateString); // Créez un objet Date à partir de cette chaîne de caractères
                            const dataPoint = data.find(d => {
                                const dataDate = new Date(d.date);
                                return tickDate.getDate() === dataDate.getDate() &&
                                    tickDate.getMonth() === dataDate.getMonth() &&
                                    tickDate.getFullYear() === dataDate.getFullYear();
                            });
                            return dataPoint && dataPoint.displayYear ? 'green' : 'black';
                        }
                    }
                }}
            />

            <VictoryAxis 
                dependentAxis 
                gridComponent={<></>} // Supprime les lignes de grille verticales
            />

            <VictoryLine 
                data={data}
                x="date"
                y="value"
            />

            <VictoryScatter
                data={data}
                x="date"
                y="value"
                size={({ datum }) => datum.isToday ? dynamicPointSize : ((datum.sales && datum.sales.length > 0) || (datum.buys && datum.buys.length > 0)) ? dynamicPointSize : 0}

                style={{ data: { fill: (datum) => determineColor(datum) } }}
                labels={({ datum }) => 
                datum.isToday ? 
                `Date: ${formatDate(datum.date)}\nValeur totale en USD: ${datum.totalPortfolioValue.toFixed(2)} $` :
                (datum.sales && datum.sales.length > 0 ? 
                    datum.sales.map(sale => 
                        `\n\nVente\nToken: ${sale.crypto}\nQuantité: ${sale.amount}\nPrix: ${sale.totalPrice / sale.amount} $\nTotal: ${sale.totalPrice} $\nDate: ${formatDate(datum.date)}`
                    ).join(', ') :
                    datum.buys && datum.buys.length > 0 ?
                    datum.buys.map(buy => 
                        `\n\nAchat\nToken: ${buy.crypto}\nQuantité: ${buy.amount}\nPrix: ${buy.totalPrice / buy.amount} $\nTotal: ${buy.totalPrice} $\nDate: ${formatDate(datum.date)}`
                    ).join(', ') :
                    "")
            }
                labelComponent={
                    <VictoryTooltip
                        style={{ fontSize: 10 }}
                        flyoutStyle={({ datum }) => ({
                            stroke: datum.sales && datum.sales.length > 0 ? "red" : "darkorange",
                            fill: "#FFCC66",
                            strokeWidth: 1
                        })}
                    />
                }
            />
        </VictoryChart>
    );
};


export const getPriceAtDate = (historique, date) => {
    const price_by_date = {};

    historique.forEach(entry => {
        price_by_date[entry.date] = entry.prix;
    });

    let closestPrice;
    if (price_by_date[date]) {
        closestPrice = price_by_date[date];
    } else {
        const availableDates = Object.keys(price_by_date).sort();
        const latestDate = availableDates[availableDates.length - 1];
        closestPrice = price_by_date[latestDate];
    }

    return closestPrice;
}


export const TokenGraph = ({ data }) => {
    
    return (
        <VictoryChart 
            theme={VictoryTheme.material}
            responsive={true} 
            width={800} 
            height={300}
            padding={{ top: 10, right: 50, bottom: 60, left: 50 }}
        >
            <VictoryAxis
                tickValues={data.map(d => d.date)}
                gridComponent={<></>}
                tickLabelComponent={
                    <VictoryLabel 
                        angle={90} 
                        verticalAnchor="middle" 
                        textAnchor="start" 
                    />
                }
                tickFormat={(t) => {
                    const dataPoint = data.find(d => d.date === t);
                    return dataPoint ? formatAxisDate(t, dataPoint.displayYear) : "";
                }}
                style={{
                    ticks: {stroke: "grey", size: 5},
                    tickLabels: {
                        fontSize: 11,
                        padding: 5,
                        fill: (t) => {
                            const tickDateString = t.tick;
                            const tickDate = new Date(tickDateString);
                            const dataPoint = data.find(d => {
                                const dataDate = new Date(d.date);
                                return tickDate.getDate() === dataDate.getDate() &&
                                    tickDate.getMonth() === dataDate.getMonth() &&
                                    tickDate.getFullYear() === dataDate.getFullYear();
                            });
                            return dataPoint && dataPoint.displayYear ? 'green' : 'black';
                        }
                    }
                }}
            />

            <VictoryAxis 
                dependentAxis 
                gridComponent={<></>} // Supprime les lignes de grille verticales
            />
            <VictoryLine
                data={data}
                x="date"
                y="totalValue"
            />
            <VictoryLine
                data={data}
                x="date"
                y="totalSupply"
                style={{ data: { stroke: "green", strokeDasharray: "5,5" } }}
            />
            <VictoryScatter
                data={data}
                x="date"
                y="totalValue"
                size={5}
                style={{ data: { fill: "black" } }}
                labels={({ datum }) => 
                    `Crypto: ${datum.tokenName}\n` + 
                    `Date: ${datum.date}\n` +
                    `Quantité: ${datum.transactionSupply}\n` +
                    `Prix: ${datum.transactionPrice.toFixed(2)} $\n` +
                    `Valeur: ${(datum.transactionSupply * datum.transactionPrice).toFixed(2)} $\n` +
                    `Quantité total: ${datum.totalSupply}\n` +
                    `Valeur total: ${datum.totalValue.toFixed(2)} $`
                }
                labelComponent={<VictoryTooltip />}
            />

            <VictoryScatter
                data={data.filter(d => d.totalValue  !== d.totalSupply)}
                x="date"
                y="totalSupply"
                size={5}
                style={{ data: { fill: "green" } }}
                labels={({ datum }) => 
                    `Crypto: ${datum.tokenName}\n` + 
                    `Date: ${datum.date}\n` +
                    `Quantité: ${datum.transactionSupply}\n` +
                    `Prix: ${(datum.transactionPrice || 0).toFixed(2)} $\n` +  // <-- Ajout d'une vérification ici
                    `Valeur: ${((datum.transactionSupply || 0) * (datum.transactionPrice || 0)).toFixed(2)} $\n` +
                    `Quantité total: ${datum.totalSupply}\n` +
                    `Valeur total: ${datum.totalValue.toFixed(2)} $`
                }

                labelComponent={<VictoryTooltip />}
            />
        </VictoryChart>
    );
};


export const generateTokenChartData = (tokenDetails) => {

    const tokenChartData = [];
    
    let current_supply = 0;
    let totalValueForDate = 0;
    
    const sortedTransactions = tokenDetails.transaction.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const dayBeforeFirstTransaction = new Date(new Date(sortedTransactions[0].date).getTime() - 86400000);
    tokenChartData.push({
        date: dayBeforeFirstTransaction.toISOString().split('T')[0],
        supply: 0,
        value: 0,
        totalSupply: 0,     // Ajout de cette ligne
        totalValue: 0       // Ajout de cette ligne
    });
    
    sortedTransactions.forEach(transaction => {
        const transactionType = transaction.transactionType;
        const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
        
        // Récupérer le prix du token à la date de la transaction
        const priceAtDate = getPriceAtDate(tokenDetails.historique, transactionDate);
        
        if (transactionType === "achat") {
            current_supply += transaction.supply;
        } else if (transactionType === "vente") {
            current_supply -= transaction.supply;
        }
        
        totalValueForDate = current_supply * priceAtDate;

        console.log(`Transaction Date: ${transactionDate}`);
        console.log(`Total Supply: ${current_supply}`);
        console.log(`Price at Date: ${priceAtDate}`);
        console.log(`Total Value: ${totalValueForDate}`);


        tokenChartData.push({
            date: transactionDate,
            supply: current_supply,
            value: totalValueForDate,
            transactionType: transactionType,
            transactionSupply: transaction.supply,
            transactionPrice: priceAtDate,
            transactionValue: transaction.supply * priceAtDate,
            totalSupply: current_supply,
            totalValue: current_supply * priceAtDate,
            tokenName: tokenDetails.tokenName
        });
    });
    
    const lastTransaction = sortedTransactions[sortedTransactions.length - 1];
    const lastHistoriquePrice = tokenDetails.historique[tokenDetails.historique.length - 1].prix;

    const today = new Date();
    tokenChartData.push({
        date: today.toISOString().split('T')[0],
        supply: current_supply,
        value: current_supply * tokenDetails.lastPrice,
        totalValue: current_supply * tokenDetails.lastPrice,
        transactionType: lastTransaction.transactionType,
        transactionSupply: lastTransaction.supply,
        transactionPrice: lastHistoriquePrice,
        transactionValue: lastTransaction.supply * lastHistoriquePrice,
        tokenName: tokenDetails.tokenName,
        totalSupply: current_supply
    });

    console.log("All Data Points:");
    tokenChartData.forEach(point => {
        console.log(`Date: ${point.date}, Total Supply: ${point.totalSupply}, Total Value: ${point.totalValue}`);
    });
    return tokenChartData;
};

