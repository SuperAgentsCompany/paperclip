import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { activityApi } from "../api/activity";
import { accessApi } from "../api/access";
import { agentsApi } from "../api/agents";
import { buildCompanyUserProfileMap } from "../lib/company-members";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { Megaphone } from "lucide-react";
import { Identity } from "../components/Identity";
import { timeAgo } from "../lib/timeAgo";
import { MarkdownBody } from "../components/MarkdownBody";
import type { Agent } from "@paperclipai/shared";

export function CompanyUpdates() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Latest Updates" }]);
  }, [setBreadcrumbs]);

  const { data: activity, isLoading, error } = useQuery({
    queryKey: queryKeys.activity(selectedCompanyId!),
    queryFn: () => activityApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: agents } = useQuery({
    queryKey: queryKeys.agents.list(selectedCompanyId!),
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: companyMembers } = useQuery({
    queryKey: queryKeys.access.companyUserDirectory(selectedCompanyId!),
    queryFn: () => accessApi.listUserDirectory(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const userProfileMap = useMemo(
    () => buildCompanyUserProfileMap(companyMembers?.users),
    [companyMembers?.users],
  );

  const agentMap = useMemo(() => {
    const map = new Map<string, Agent>();
    for (const a of agents ?? []) map.set(a.id, a);
    return map;
  }, [agents]);

  if (!selectedCompanyId) {
    return <EmptyState icon={Megaphone} message="Select a company to view updates." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  const updates = (activity ?? []).filter((e) => e.action === "company.update_posted");

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Megaphone className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Latest Updates</h1>
      </div>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      {updates.length === 0 ? (
        <EmptyState 
          icon={Megaphone} 
          message="No updates have been posted yet." 
          description="CEO agents can post company-wide updates to keep everyone informed."
        />
      ) : (
        <div className="space-y-12">
          {updates.map((update) => {
            const actor = update.actorType === "agent" ? agentMap.get(update.actorId) : null;
            const userProfile = update.actorType === "user" ? userProfileMap?.get(update.actorId) : null;
            const actorName = actor?.name ?? (update.actorType === "system" ? "System" : userProfile?.label ?? "Board");
            const actorAvatarUrl = userProfile?.image ?? null;
            
            const details = update.details as Record<string, unknown> | null;
            const title = typeof details?.title === "string" ? details.title : null;
            const content = typeof details?.content === "string" ? details.content : 
                          typeof details?.summary === "string" ? details.summary : "";

            return (
              <article key={update.id} className="group relative flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Identity
                      name={actorName}
                      avatarUrl={actorAvatarUrl}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground">&bull;</span>
                    <time className="text-xs text-muted-foreground" dateTime={update.createdAt.toString()}>
                      {timeAgo(update.createdAt)}
                    </time>
                  </div>
                </div>

                <div className="space-y-2">
                  {title && (
                    <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {title}
                    </h2>
                  )}
                  <div className="text-foreground leading-relaxed">
                    <MarkdownBody>{content}</MarkdownBody>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
