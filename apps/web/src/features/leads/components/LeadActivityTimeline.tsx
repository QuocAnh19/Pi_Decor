import { useState, useId, FormEvent, ChangeEvent } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { createLeadActivitySchema } from "@pidecor/shared";
import type { LeadActivity } from "../../../lib/types";
import { formatDateTime, formatRelativeTime } from "../../../lib/formatters";
import { useLeadActivitiesQuery, useAddLeadActivityMutation } from "../hooks/leads.queries";
import styles from "./LeadActivityTimeline.module.scss";

interface LeadActivityTimelineProps {
  leadId: string;
}

const ACTIVITY_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: typeof PhoneIcon }
> = {
  note: {
    label: "Ghi chú",
    badgeClass: styles.badgeNote,
    icon: ChatBubbleBottomCenterTextIcon,
  },
  call: {
    label: "Cuộc gọi",
    badgeClass: styles.badgeCall,
    icon: PhoneIcon,
  },
  call_logged: {
    label: "Cuộc gọi",
    badgeClass: styles.badgeCall,
    icon: PhoneIcon,
  },
  email: {
    label: "Email",
    badgeClass: styles.badgeEmail,
    icon: EnvelopeIcon,
  },
  status_change: {
    label: "Đổi trạng thái",
    badgeClass: styles.badgeStatus,
    icon: ArrowsRightLeftIcon,
  },
  quotation_sent: {
    label: "Báo giá",
    badgeClass: styles.badgeQuotation,
    icon: DocumentTextIcon,
  },
  system: {
    label: "Hệ thống",
    badgeClass: styles.badgeSystem,
    icon: Cog6ToothIcon,
  },
};

export function LeadActivityTimeline({ leadId }: LeadActivityTimelineProps) {
  const textareaId = useId();
  const [selectedType, setSelectedType] = useState<"note" | "call" | "email">("note");
  const [body, setBody] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: activities, isLoading, isError, refetch } = useLeadActivitiesQuery(leadId);
  const addMutation = useAddLeadActivityMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const result = createLeadActivitySchema.safeParse({
      activity_type: selectedType,
      body: body.trim() || null,
    });

    if (!result.success) {
      setValidationError(result.error.issues[0]?.message || "Dữ liệu không hợp lệ.");
      return;
    }

    if (!body.trim()) {
      setValidationError("Vui lòng nhập nội dung ghi chú hoặc cuộc gọi.");
      return;
    }

    await addMutation.mutateAsync({
      leadId,
      activity_type: selectedType,
      body: body.trim(),
    });

    setBody("");
  };

  const visibleActivities = (activities || []).slice(0, displayCount);
  const hasMore = (activities || []).length > displayCount;

  return (
    <div className={styles.timelineContainer}>
      {/* Form tạo ghi chú / cuộc gọi */}
      <form onSubmit={handleSubmit} className={styles.addActivityCard}>
        <div className={styles.activityTypeSelector}>
          <button
            type="button"
            className={`${styles.typeBtn} ${selectedType === "note" ? styles.typeBtnActive : ""}`}
            onClick={() => setSelectedType("note")}
          >
            <ChatBubbleBottomCenterTextIcon style={{ width: 16, height: 16 }} />
            <span>Ghi chú</span>
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${selectedType === "call" ? styles.typeBtnActive : ""}`}
            onClick={() => setSelectedType("call")}
          >
            <PhoneIcon style={{ width: 16, height: 16 }} />
            <span>Cuộc gọi</span>
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${selectedType === "email" ? styles.typeBtnActive : ""}`}
            onClick={() => setSelectedType("email")}
          >
            <EnvelopeIcon style={{ width: 16, height: 16 }} />
            <span>Email</span>
          </button>
        </div>

        <textarea
          id={textareaId}
          value={body}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setBody(e.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder={
            selectedType === "call"
              ? "Ghi lại nội dung cuộc gọi tư vấn..."
              : selectedType === "email"
                ? "Ghi nhận nội dung email đã trao đổi..."
                : "Thêm ghi chú nội bộ về khách hàng..."
          }
          className={styles.textarea}
          rows={3}
          maxLength={2000}
        />

        {validationError && (
          <p className={styles.errorMessage} role="alert">
            {validationError}
          </p>
        )}

        <div className={styles.formFooter}>
          <span className={styles.charCount}>{body.length}/2000 ký tự</span>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={addMutation.isPending || !body.trim()}
          >
            {addMutation.isPending ? "Đang lưu..." : "Lưu hoạt động"}
          </button>
        </div>
      </form>

      {/* Danh sách Timeline */}
      {isLoading ? (
        <div className={styles.loadingTimeline}>Đang tải dòng thời gian hoạt động...</div>
      ) : isError ? (
        <div className={styles.errorTimeline}>
          Không thể tải lịch sử hoạt động.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            Thử lại
          </button>
        </div>
      ) : !activities || activities.length === 0 ? (
        <div className={styles.emptyTimeline}>
          Chưa có hoạt động hay ghi chú nào được ghi nhận cho khách hàng này.
        </div>
      ) : (
        <div className={styles.timelineList}>
          {visibleActivities.map((act: LeadActivity) => {
            const config = ACTIVITY_CONFIG[act.activity_type] || {
              label: act.activity_type,
              badgeClass: styles.badgeSystem,
              icon: ChatBubbleBottomCenterTextIcon,
            };
            const Icon = config.icon;
            const fullTime = formatDateTime(act.created_at);
            const relativeTime = formatRelativeTime(act.created_at);

            return (
              <div key={act.id} className={styles.timelineItem}>
                <div className={styles.timelineDot}>
                  <div className={styles.timelineDotInner} />
                </div>
                <div className={styles.itemContent}>
                  <div className={styles.itemHeader}>
                    <div className={styles.itemTitleRow}>
                      <span className={`${styles.activityBadge} ${config.badgeClass}`}>
                        <Icon
                          style={{
                            width: 13,
                            height: 13,
                            display: "inline-block",
                            verticalAlign: "middle",
                            marginRight: 4,
                          }}
                        />
                        {config.label}
                      </span>
                      {act.admin_email ? (
                        <span className={styles.adminTag} title={act.admin_email}>
                          <UserCircleIcon style={{ width: 14, height: 14 }} />
                          {act.admin_name || act.admin_email}
                        </span>
                      ) : (
                        <span
                          className={styles.adminTag}
                          style={{ fontStyle: "italic", color: "#9ca3af" }}
                        >
                          (Hệ thống / Admin cũ)
                        </span>
                      )}
                    </div>
                    <span className={styles.itemMeta}>
                      <span className={styles.timeTooltip} title={fullTime}>
                        {relativeTime}
                      </span>
                    </span>
                  </div>

                  {act.body && <p className={styles.itemBody}>{act.body}</p>}
                </div>
              </div>
            );
          })}

          {hasMore && (
            <button
              type="button"
              className={styles.loadMoreBtn}
              onClick={() => setDisplayCount((prev) => prev + 10)}
            >
              Xem thêm hoạt động cũ hơn ({activities.length - displayCount} mục)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
