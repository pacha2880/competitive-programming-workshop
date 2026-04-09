//para importar todas las librerias
#include <bits/stdc++.h>
//macros 
#define PI 			acos(-1)
#define mp			make_pair
#define pb			push_back
#define all(a)		(a).begin(), (a).end()
#define srt(a)			sort(all(a))
#define mem(a, h)	memset(a, (h), sizeof(a))
#define f 			first
#define s 			second
#define MOD			1000000007
#define EPS			1e-9
int in(){int r=0,c;for(c=getchar();c<=32;c=getchar());if(c=='-') return -in();for(;c>32;r=(r<<1)+(r<<3)+c-'0',c=getchar());return r;}

using namespace std;

typedef long long 		ll;
typedef unsigned long long 		ull;
typedef pair<int, int>  ii;
typedef vector<int>     vi;
typedef vector<ii>      vii;
typedef vector<ll>      vll;
int main()
{
	//fast input
	ios::sync_with_stdio(false); cin.tie(0);
	//para leer o imprimir en archivos
	//freopen("qwe.txt", "r", stdin);
	//freopen("asd.txt", "w", stdout);
	int a,b;
	char f = 's';
	string palabra = "asd";
	bool r = 123;
	double s = 4.0;
	long long u= 12345678909876543;
	int x,y, arreglo[123];
	for(int i = 0; i < 123; i++)
		arreglo[i] = 0;
	mem(arreglo, 0);
	//arreglo dinamico no hay por ni push front :v
	vector<int> ve;
	ve.push_back(3);
	a = ve[ve.size()-1];
	ve.pop_back(); 
	ve.clear();
	ve.resize(1000);
	ve.assign(100,23);
	//pila
	stack<int> st;
	st.push(1);
	a = st.top();
	st.pop();
	if(st.empty())
		cout<<"vacio";
	//cola
	queue<int> que;
	que.push(3);
	a = que.front();
	que.pop();
	//pares
	pair<int,int> pa, pa1 = make_pair(1,3);
	pa = make_pair(1,2);
	pa.first = 1;
	pa.second = 34;
	if(pa>pa1) //compara primero el de la izquierda
		cout<<"pa\n";
	return 0;
}
//para compilar desde consola vayan a la direccion del archivo y
//g++ template.cpp -o template
//para hacer correr
//template
// read the question correctly (is y a vowel? what are the exact constraints?)
// look out for SPECIAL CASES (n=1?) and overflow (ll vs int?) ARRAY OUT OF BOUNDSS