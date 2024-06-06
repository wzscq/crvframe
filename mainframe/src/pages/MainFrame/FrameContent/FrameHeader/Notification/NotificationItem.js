export default function NotificationItem({item}){
    return (
    <div className="task-item">
        <div className="task-item-title">{item.title}</div>
        <div className="task-item-content">{item.content}</div>
    </div>);
}