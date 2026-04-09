#include <bits/stdc++.h>
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

struct nodo
{
	int x;
	nodo() {x = 0;}
	//nodo(int X, int Y): x(X),y(Y){} 
	nodo(int X): x(X){}
};
nodo join(nodo a, nodo b)
{
	return nodo(a.x+b.x);
}

nodo A[100000], T[400000];

void init(int b, int e, int node)
{
	if(b == e)
	{
		T[node] = A[b];
		return;
	}
	int mid = (b + e)/2, iz = node*2+1, de = iz+1;
	init(b,mid,iz);
	init(mid+1,e,de);
	T[node] = join(T[iz],T[de]);
}

nodo query(int b, int e, int node, int i, int j)
{
	if(b >= i && e <= j)
		return T[node];
	int mid = (b+e)/2, iz = node*2+1, de = iz+1;
	if(i>mid)
		return query(mid+1, e, de, i, j);
	if(j<=mid)
		return query(b, mid, iz, i, j);
	return(join(query(mid+1, e, de, i, j),
				query(b, mid, iz, i, j)));
}

void update(int b, int e, int node, int pos, nodo val)
{
	if(b==e)
	{
		T[node] = val;
		A[b] = val;
		return;
	}
	int mid = (b+e)/2, iz = node*2+1, de = iz+1;
	if(pos > mid)
		update(mid + 1, e, de, pos, val);
	else
		update(b, mid, iz, pos, val);
	T[node] = join(T[iz], T[de]);	
}

int main()
{
	//ios::sync_with_stdio(false); cin.tie(0);
	//freopen("qwe.txt", "r", stdin);
	//freopen("asd.txt", "w", stdout);
	//nodo a;
	//a.iz = 3;
	//a.res = a.iz + 4;
	int n,m,a,b,tipo;
	cin>>n;
	for(int i =0; i<n; i++)
	{
		cin>>a;
		A[i] = nodo(a);
	}
	init(0, n-1, 0);
	cin>>m;
	while(m--)
	{
		cin>>tipo>>a>>b;
		if(tipo)
			cout<<query(0, n-1, 0, a, b).x<<endl;
		else
		{
			update(0, n-1, 0, a, nodo(b));
			for(int i = 0; i< n; i++)
			{
				cout<<A[i].x<<' ';
			}
			cout<<endl;
		}
	}
	return 0;
}

// read the question correctly (is y a vowel? what are the exact constraints?)
// look out for SPECIAL CASES (n=1?) and overflow (ll vs int?) ARRAY OUT OF BOUNDSSn