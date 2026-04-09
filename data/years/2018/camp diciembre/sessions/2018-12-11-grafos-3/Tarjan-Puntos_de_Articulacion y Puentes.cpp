
#include <bits/stdc++.h>

#define pb push_back
#define tam 320000

using namespace std;
typedef long long ll;
vector<int> grafo[tam];
bool visitado[tam];
int primerallegada[tam],subida[tam];
int contador;
bool articulationpoint[tam];
void limpiar()
{
    //hay muchos bugs cuando son varios casos hay que tener cuidado de elimiar todo lo que usamos en el sig caso sea preciso
    contador=1;
    for (int i = 0; i < tam; ++i)
    {
        visitado[i]=false;
        articulationpoint[i]=false;
        grafo[i].clear();//importante no acumular los grafos debido a que son varios casos
    }
}
int hijosiniciales=0,nodoinicial;
int padre[tam];
void dfs(int nodo)
{
    visitado[nodo]=true;
    primerallegada[nodo]=subida[nodo]=contador++;
    int hijo;
    //<<nodo<<" ";
    for (int i = 0; i < grafo[nodo].size(); ++i)
    {
        hijo=grafo[nodo][i];
        if (visitado[hijo]==false)
        {
            if (nodoinicial==nodo)
            {
                //<<hijo<<"jo jo\n";
                hijosiniciales++;
            }
            padre[hijo]=nodo;
            dfs(hijo);
            if (subida[hijo]>=primerallegada[nodo])
            {
                articulationpoint[nodo]=true;
            }
            if (subida[hijo]>primerallegada[nodo])
            {
                //no pertenece a ningun ciclo por lo tanto soy un puente
                //en este problema no nos piden puentes ... no haremos nada
                //<<nodo<<" "<<hijo<<" es un puente"<<endl;
            }
            subida[nodo]=min(subida[hijo],subida[nodo]);

        } 
        else
        {
            if (hijo!=padre[nodo])
            {
                //soy un backedge
                subida[nodo]=min(subida[nodo],primerallegada[hijo]);
            }
        }
    }
}
int main()
{
    int n;
    int casos=1;
    //freopen("out.txt","w",stdout);
    while(cin>>n)
    {
        if (n==0)break;
        string nombre;
        vector<string> txt;
        map<string,int> mapa;
        string txt1,txt2;
        limpiar();
        for (int i = 1; i <= n; ++i)
        {
            cin>>nombre;
            mapa[nombre]=i;

            txt.pb(nombre);
            //hacemos un mapeo para el nombre con un valor numerico
        }
        int m;
        cin>>m;
        int nodo1,nodo2;
        for (int i = 0; i < m; ++i)
        {
            cin>>txt1>>txt2;
            nodo1=mapa[txt1];
            nodo2=mapa[txt2];
            grafo[nodo1].pb(nodo2);
            grafo[nodo2].pb(nodo1);
            //<<nodo1<<" aca "<<nodo2<<endl;
        }
        vector<string> respuestas;
        for(int i=1;i<=n;i++)
        {
            if (visitado[i]==false)
            {
                nodoinicial=i;
                hijosiniciales=0;//borrar hijosiniciales del anterior caso
                dfs(i);
                //<<hijosiniciales<<" ";
                if (hijosiniciales>1)
                    articulationpoint[i]=true;
                else
                    articulationpoint[i]=false;
            }
            if (articulationpoint[i]==true)
                respuestas.pb(txt[i-1]);
        }
        
        if (casos>1)
        {
            //el problema te pide que imprimas un salto de linea entre casos, pero si solo te dan un caso no imprimes salto de linea
            cout<<endl;
        }
        int auxsize=respuestas.size();
        printf("City map #%d: %d camera(s) found\n",casos++,auxsize);
        sort(respuestas.begin(),respuestas.end());
        for (int i = 0; i < respuestas.size(); ++i)
        {
            cout<<respuestas[i]<<endl;
        }
    }
}

