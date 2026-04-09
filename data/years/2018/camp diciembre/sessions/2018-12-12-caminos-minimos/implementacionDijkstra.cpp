#include <bits/stdc++.h>
vector<vi> g,gp;
int bfs(int s, int t)
{
	priority_queue<pair<int,int> > que;
	que.push(make_pair(0,s));
	int dist[n];
	for(int i =0; i<n;i++)
		dist[i] = 1000000000;
	dist[s] = 0;
	int peso, nodo, hijo, hijop;
	while(!que.empty())
	{
		nodo = que.top().second;
		peso = -que.top().first;
		que.pop();
		for(int i = 0; i< g[nodo].size(); i++)
		{
			hijo = g[nodo][i];
			hijop = gp[nodo][i];
			if(dist[hijo] > peso + hijop)
			{
				dist[hijo] = peso + hijop;
				que.push(make_pair(-dist[hijo],hijo));
			}
		}
	}
		return dist[t];
}