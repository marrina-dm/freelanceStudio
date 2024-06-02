import {HttpUtils} from "../utils/http-utils";
import config from "../config/config";

export class Dashboard {
    openNewRoute = null;

    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.getOrders().then();
    }

    async getOrders() {
        const result = await HttpUtils.request('/orders');
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && (result.response.error || !result.response.orders))) {
            return alert('Возникла ошибка при запросе заказов. Обратитесь в поддержку');
        }

        this.loadOrdersInfo(result.response.orders);
        this.loadCalendarInfo(result.response.orders);
    }

    loadOrdersInfo(orders) {
        document.getElementById('count-orders').innerText = orders.length;
        document.getElementById('done-orders').innerText = orders.filter(order => order.status === config.orderStatuses.success).length;
        document.getElementById('in-progress-orders').innerText = orders.filter(order => [config.orderStatuses.confirmed, config.orderStatuses.new].includes(order.status)).length;
        document.getElementById('canceled-orders').innerText = orders.filter(order => order.status === config.orderStatuses.canceled).length;
    }

    loadCalendarInfo(orders) {
        const preparedEvents = [];

        for (let i = 0; i < orders.length; i++) {
            let color = null;
            if (orders[i].status === config.orderStatuses.success) {
                color = 'gray';
            }

            if (orders[i].scheduledDate && !orders[i].completeDate) {
                preparedEvents.push({
                    title: orders[i].freelancer.name + ' ' + orders[i].freelancer.lastName + ' выполняет заказ ' + orders[i].number,
                    start: new Date(orders[i].scheduledDate),
                    backgroundColor: '#00c0ef',
                    borderColor: '#00c0ef',
                    allDay: true
                });
            }

            if (orders[i].deadlineDate) {
                preparedEvents.push({
                    title: 'Дедлайн заказа ' + orders[i].number,
                    start: new Date(orders[i].deadlineDate),
                    backgroundColor: color ? color : '#f39c12',
                    borderColor: color ? color : '#f39c12',
                    allDay: true
                });
            }

            if (orders[i].completeDate) {
                preparedEvents.push({
                    title: 'Заказа ' + orders[i].number + ' выполнен фрилансером ' + orders[i].freelancer.name,
                    start: new Date(orders[i].completeDate),
                    backgroundColor: '#00a65a',
                    borderColor: '#00a65a',
                    allDay: true
                });
            }
        }

        (new FullCalendar.Calendar(document.getElementById('calendar'), {
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            themeSystem: 'bootstrap',
            events: preparedEvents,
            firstDay: 1,
            locale: 'ru'
        })).render();
    }
}