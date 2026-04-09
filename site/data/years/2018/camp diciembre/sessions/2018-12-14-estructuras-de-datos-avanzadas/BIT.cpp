#include <bits/stdc++.h>
#define PI                acos(-1)
#define pb                push_back
#define mp                make_pair
#define all(a)            (a).begin(), (a).end()
#define clr(a,h)          memset(a, (h), sizeof(a))
#define F first
#define S second
int faster_in(){int r=0,c;for(c=getchar();c<=32;c=getchar());if(c=='-') return -faster_in();for(;c>32;r=(r<<1)+(r<<3)+c-'0',c=getchar());return r;}

using namespace std;

typedef long long       ll;
typedef pair<int, int>  ii;
typedef vector<int>     vi;
typedef vector<ii>      vii;
typedef vector<ll>      vll;
const int INF = int(1e9 + 7);

const int tam = 100010;

int n;
int BIT[tam];

void update(int pos, int val)
{
	pos++;
	for (int i = pos; i <= n; i += (i & -i))
	{
		BIT[i] += val;
	}
}

int query(int pos)
{
	pos++;
	int res = 0;
	for (int i = pos; i > 0; i -= (i & -i))
	{
		res += BIT[i];
	}
	return res;
}

int main()
{
    std::ios::sync_with_stdio(false); cin.tie(0);
    //freopen("","r",stdin);
    //freopen("","w",stdout);
	cin >> n;
	int A[n];
	clr(BIT, 0);
	for (int i = 0; i < n; i++)
	{
		cin >> A[i];
		update(i, A[i]);
	}
	int q;
	cin >> q;
	while (q--)
	{
		int a, b;
		cin >> a >> b;
		cout << query(b) - query(a-1) << endl;
	}
    return 0;
}
// PLUS ULTRA!